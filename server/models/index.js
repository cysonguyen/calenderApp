const User = require("./user");
const Group = require("./group");
const Schedule = require("./schedule");
const Meeting = require("./meeting");
const UserGroup = require("./userGroup");
const ScheduleUser = require("./scheduleUser");
const sequelize = require("../config/sequelize");
const MeetingCycle = require("./meetingCycles");
const Notification = require("./notification");
const Report = require("./report");
const ScheduleGroup = require("./scheduleGroup");

User.belongsToMany(Group, { through: UserGroup, foreignKey: "user_id" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "group_id" });

User.belongsToMany(Schedule, { through: ScheduleUser, foreignKey: "user_id" });
Schedule.belongsToMany(User, {
  through: ScheduleUser,
  foreignKey: "schedule_id",
});

Schedule.hasMany(MeetingCycle, { foreignKey: "schedule_id", onDelete: "CASCADE" });
MeetingCycle.belongsTo(Schedule, { foreignKey: "schedule_id", onDelete: "CASCADE" });

MeetingCycle.hasMany(Meeting, { foreignKey: "meeting_cycle_id", onDelete: "CASCADE" });
Meeting.belongsTo(MeetingCycle, { foreignKey: "meeting_cycle_id", onDelete: "CASCADE" });

User.hasMany(Notification, { foreignKey: "user_id", onDelete: "CASCADE" });
Notification.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

Meeting.hasMany(Report, { foreignKey: "meeting_id", onDelete: "CASCADE" });
Report.belongsTo(Meeting, { foreignKey: "meeting_id", onDelete: "CASCADE" });

Schedule.belongsToMany(Group, { through: ScheduleGroup, foreignKey: "schedule_id" });
Group.belongsToMany(Schedule, { through: ScheduleGroup, foreignKey: "group_id" });

sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Database sync error:", err));

module.exports = {
  User,
  Group,
  Schedule,
  Meeting,
  UserGroup,
  ScheduleUser,
  MeetingCycle,
  Notification,
  Report,
  ScheduleGroup,
};
