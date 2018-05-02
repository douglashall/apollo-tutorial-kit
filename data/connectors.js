import querystring from 'querystring';
import Sequelize from 'sequelize';
import appendQuery from 'append-query'
import casual from 'casual';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import _ from 'lodash';

dotenv.config();

const lmsUrl = process.env.LMS_URL;
const lmsApiKey = process.env.LMS_API_KEY;
const accessTokenApiUrl = lmsUrl + '/oauth2/access_token';
const enrollmentApiUrl = lmsUrl + '/api/enrollment/v1/enrollment';

const db = new Sequelize('blog', null, null, {
  dialect: 'sqlite',
  storage: './blog.sqlite',
});

const accessToken = () => {
  let requestBody = {
    grant_type: 'client_credentials',
    client_id: process.env.API_CLIENT_ID,
    client_secret: process.env.API_CLIENT_SECRET,
    token_type: 'jwt'
  };
  return fetch(
    appendQuery(accessTokenApiUrl),
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: querystring.stringify(requestBody)
    }
  )
  .then(res => res.json())
  .then(res => {
    return res.access_token;
  });
}

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

const ApiEnrollment = {
  getAllForUser(username) {
    return accessToken().then(token => {
      return fetch(
        appendQuery(enrollmentApiUrl, {'user': username}),
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': 'JWT ' + token
          }
        }
      )
      .then(res => res.json())
      .then(res => {
        let enrollments = [];
        for (let enrollment of res) {
          let course_details = enrollment.course_details;
          enrollments.push({
            username: enrollment.user,
            mode: enrollment.mode,
            isActive: enrollment.is_active,
            created: enrollment.created,
            courseRun: {
              id: course_details.course_id,
              title: course_details.course_name,
              start: course_details.course_start,
              end: course_details.course_end
            }
          });
        }
        return enrollments;
      });
    });
  },
};

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

export { User, CourseRun, Enrollment, ApiEnrollment };
