import Sequelize from 'sequelize';
import casual from 'casual';
import _ from 'lodash';

const db = new Sequelize('blog', null, null, {
  dialect: 'sqlite',
  storage: './blog.sqlite',
});

const UserModel = db.define('user', {
  firstName: { type: Sequelize.STRING },
  lastName: { type: Sequelize.STRING },
});

const CourseRunModel = db.define('courseRun', {
  title: { type: Sequelize.STRING },
  fullDescription: { type: Sequelize.STRING },
  shortDescription: { type: Sequelize.STRING },
});

const EnrollmentModel = db.define('enrollment', {
  mode: { type: Sequelize.STRING },
});

UserModel.hasMany(EnrollmentModel);
CourseRunModel.hasMany(EnrollmentModel);
EnrollmentModel.belongsTo(UserModel);
EnrollmentModel.belongsTo(CourseRunModel);

// create mock data with a seed, so we always get the same
casual.seed(123);
db.sync({ force: true }).then(() => {
  _.times(10, () => {
    return CourseRunModel.create({
      title: casual.title,
      fullDescription: casual.description,
      shortDescription: casual.short_description,
    }).then((courseRun) => {
      return UserModel.create({
        firstName: casual.first_name,
        lastName: casual.last_name,
      }).then((user) => {
        return EnrollmentModel.create({
          mode: 'verified',
          userId: user.id,
          courseRunId: courseRun.id,
        });
      });
    });
  });
});

const User = db.models.user;
const CourseRun = db.models.courseRun;
const Enrollment = db.models.enrollment;

export { User, CourseRun, Enrollment };

