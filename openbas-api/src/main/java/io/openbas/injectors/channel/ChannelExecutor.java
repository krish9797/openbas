package io.openbas.injectors.channel;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.database.repository.ArticleRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.Injector;
import io.openbas.injectors.channel.model.ArticleVariable;
import io.openbas.injectors.channel.model.ChannelContent;
import io.openbas.injectors.email.service.EmailService;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.ChannelExpectation;
import io.openbas.model.expectation.ManualExpectation;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceSuccess;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;

@Component(ChannelContract.TYPE)
public class ChannelExecutor extends Injector {

  public static final String VARIABLE_ARTICLES = "articles";

  public static final String VARIABLE_ARTICLE = "article";

  @Resource
  private OpenBASConfig openBASConfig;

  private ArticleRepository articleRepository;

  private EmailService emailService;

  @Value("${openbas.mail.imap.enabled}")
  private boolean imapEnabled;

  @Autowired
  public void setArticleRepository(ArticleRepository articleRepository) {
    this.articleRepository = articleRepository;
  }

  @Autowired
  public void setEmailService(EmailService emailService) {
    this.emailService = emailService;
  }

  private String buildArticleUri(ExecutionContext context, Article article) {
    String userId = context.getUser().getId();
    String channelId = article.getChannel().getId();
    String exerciseId = article.getExercise().getId();
    String queryOptions = "article=" + article.getId() + "&user=" + userId;
    return openBASConfig.getBaseUrl() + "/channels/" + exerciseId + "/" + channelId + "?" + queryOptions;
  }

  @Override
  public ExecutionProcess process(@NotNull final Execution execution, @NotNull final ExecutableInject injection) {
    try {
      ChannelContent content = contentConvert(injection, ChannelContent.class);
      List<Article> articles = fromIterable(articleRepository.findAllById(content.getArticles()));
      String contract = injection.getInjection().getInject().getInjectorContract().getId();
      if (contract.equals(CHANNEL_PUBLISH)) {
        // Article publishing is only linked to execution date of this inject.
        String articleNames = articles.stream().map(Article::getName).collect(Collectors.joining(","));
        String publishedMessage = "Articles (" + articleNames + ") marked as published";
        execution.addTrace(traceSuccess(publishedMessage));
        Exercise exercise = injection.getInjection().getExercise();
        // Send the publication message.
        if (content.isEmailing()) {
          String from = exercise.getFrom();
          List<String> replyTos = exercise.getReplyTos();
          List<ExecutionContext> users = injection.getUsers();
          List<Document> documents = injection.getInjection().getInject().getDocuments().stream()
              .filter(InjectDocument::isAttached).map(InjectDocument::getDocument).toList();
          List<DataAttachment> attachments = resolveAttachments(execution, injection, documents);
          String message = content.buildMessage(injection, imapEnabled);
          boolean encrypted = content.isEncrypted();
          users.stream().parallel().forEach(userInjectContext -> {
            try {
              // Put the challenges variables in the injection context
              List<ArticleVariable> articleVariables = articles.stream()
                  .map(article -> new ArticleVariable(article.getId(), article.getName(),
                      buildArticleUri(userInjectContext, article)))
                  .toList();
              userInjectContext.put(VARIABLE_ARTICLES, articleVariables);
              // Send the email.
              emailService.sendEmail(execution, userInjectContext, from, replyTos, content.getInReplyTo(), encrypted,
                  content.getSubject(), message, attachments);
            } catch (Exception e) {
              execution.addTrace(traceError(e.getMessage()));
            }
          });
        } else {
          execution.addTrace(traceSuccess("Email disabled for this inject"));
        }
        List<Expectation> expectations = new ArrayList<>();
        if (!content.getExpectations().isEmpty()) {
          expectations.addAll(
              content.getExpectations()
                  .stream()
                  .flatMap((entry) -> switch (entry.getType()) {
                    case MANUAL -> Stream.of(
                        (Expectation) new ManualExpectation(entry.getScore(), entry.getName(), entry.getDescription())
                    );
                    case ARTICLE -> articles.stream()
                        .map(article -> (Expectation) new ChannelExpectation(entry.getScore(), article));
                    default -> Stream.of();
                  })
                  .toList()
          );
        }
        return new ExecutionProcess(false, expectations);
      } else {
        throw new UnsupportedOperationException("Unknown contract " + contract);
      }
    } catch (Exception e) {
      execution.addTrace(traceError(e.getMessage()));
    }
    return new ExecutionProcess(false, List.of());
  }
}
