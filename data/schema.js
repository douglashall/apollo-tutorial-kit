import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
// import mocks from './mocks';
import resolvers from './resolvers';

const typeDefs = `
type Query {
  user(firstName: String, lastName: String): User
  allUsers: [User]
  courseRun(title: String): CourseRun
  allCourseRuns: [CourseRun]
  enrollments(username: String): [ApiEnrollment]
}
type User {
  id: Int
  firstName: String
  lastName: String
  enrollments: [Enrollment]
}
type CourseRun {
  id: Int
  title: String
  fullDescription: String
  shortDescription: String
  enrollments: [Enrollment]
}
type Enrollment {
  id: Int
  user: User
  courseRun: CourseRun
  mode: String
}
type ApiEnrollment {
  username: String
  mode: String
  isActive: Boolean
  created: String
  courseRun: ApiCourseRun
}
type ApiCourseRun {
  id: String
  title: String
  start: String
  end: String
}
`;

// Add resolvers option to this call
const schema = makeExecutableSchema({ typeDefs, resolvers });

// addMockFunctionsToSchema({ schema, mocks });

export default schema;
