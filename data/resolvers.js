import { User, CourseRun, Enrollment } from './connectors';

const resolvers = {
    Query: {
      user(_, args) {
        return User.find({ where: args });
      },
      allUsers(_, args) {
        return User.findAll();
      },
      allCourseRuns(_, args) {
        return CourseRun.findAll();
      }
    },
    User: {
      enrollments(user) {
        return user.getEnrollments();
      }
    },
    CourseRun: {
      enrollments(courseRun) {
        return courseRun.getEnrollments();
      }
    },
    Enrollment: {
      user(enrollment) {
        return enrollment.getUser();
      },
      courseRun(enrollment) {
        return enrollment.getCourseRun();
      }
    }
  };
  
  export default resolvers;
  
