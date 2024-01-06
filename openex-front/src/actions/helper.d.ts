import type { Team, Exercise, InjectExpectation, Channel, Organization, Tag, User } from '../utils/api-types';

export interface ExercicesHelper {
  getExercise: (exerciseId: Exercise['exercise_id']) => Exercise;
  getExerciseInjectExpectations: (exerciseId: Exercise['exercise_id']) => InjectExpectation[];
}

export interface UsersHelper {
  getMe: () => User;
}

export interface OrganizationsHelper {
  getOrganizationsMap: () => Record<string, Organization>;
}

export interface TagsHelper {
  getTagsMap: () => Record<string, Tag>;
}

export interface TeamsHelper {
  getExerciseTeams: (exerciseId: Exercise['exercise_id']) => Team[];
  getTeamsMap: () => Record<string, Team>;
}

export interface ChannelsHelper {
  getChannel: (channelId: Channel['channel_id']) => Channel;
}

export interface LoggedHelper {
  // TODO type logged object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logged: () => any;
}
