package io.openbas.rest.scenario;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.scenario.form.InjectsImportInput;
import io.openbas.rest.scenario.response.ImportPostSummary;
import io.openbas.rest.scenario.response.ImportTestSummary;
import io.openbas.service.InjectService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

@RestController
@RequiredArgsConstructor
@Log
public class ScenarioImportApi extends RestBehavior {

    private final InjectService injectService;

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Import injects into an xls file")
    @Secured(ROLE_USER)
    public ImportPostSummary importXLSFile(@PathVariable @NotBlank final String scenarioId, @RequestPart("file") @NotNull MultipartFile file) {
        return injectService.storeXlsFileForImport(file);
    }

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls/{importId}/test")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Test the import of injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary testImportXLSFile(@PathVariable @NotBlank final String scenarioId,
                                               @PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportInput input) {
        return injectService.importInjectIntoScenarioFromXLS(scenarioId, input, importId, false);
    }

    @PostMapping(SCENARIO_URI + "/{scenarioId}/xls/{importId}/import")
    @Transactional(rollbackOn = Exception.class)
    @Operation(summary = "Validate and import injects from an xls file")
    @Secured(ROLE_USER)
    public ImportTestSummary validateImportXLSFile(@PathVariable @NotBlank final String scenarioId,
                                               @PathVariable @NotBlank final String importId,
                                               @Valid @RequestBody final InjectsImportInput input) {
        return injectService.importInjectIntoScenarioFromXLS(scenarioId, input, importId, true);
    }
}
