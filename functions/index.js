import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import NotificationModal from "../models/notification.modal.js";
import EmployeeModal from "../models/admin/employee.modal.js";
import moment from "moment";
import "dotenv/config";
import router from "../routes/index.js";
import serverless from "serverless-http";

const api = express();
const server = http.createServer(api);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = 5001;

api.use(cors());
api.use(express.json());
api.use(express.urlencoded({ extended: false }));
api.use(cookieParser());

api.get("/api/hello", (req, res) => {
  res.send("Hello World!");
});
api.use("/api/v1", router);

api.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

io.on("connection", (socket) => {
  console.log("New Connection created", socket.id);
  socket.on("join", (empid) => {
    console.log("Id for we send the dataa is ", empid);
    socket.join(empid);
    console.log(
      "Size of user conected to ",
      io.sockets.adapter.rooms.get(empid).size
    );
  });

  socket.on("leaveStatusUpdate", (data) => {
    const { employeeId, status, leaveId } = data;
    console.log(
      `empid ${employeeId} and status is  ${status} and leave id is ${leaveId}`
    );
    async function notificationForEmployee() {
      const check = await EmployeeModal.findOne({
        "personalInfo.employeeId": employeeId,
      });
      if (!check) {
        res.status(404).json({ message: "Employee does not exist" });
      } else {
        const newDataObj = {
          status: status,
          leaveId: leaveId,
          employeeId: employeeId,
          time: moment().format("hh:mm a"),
          date: moment().format("MMM Do YYYY"),
          message: `Your leave apilication has been ${data.status}.`,
          typeofNotification: "leave",
        };
        console.log(newDataObj, "vgbhnjm,");

        const response = await NotificationModal.create(newDataObj);
        if (response) {
          console.log("response is ", response);
        }
        io.to(employeeId).emit("getnotification", newDataObj);
      }
    }
    notificationForEmployee();
  });

  const employeeBirthdayAnniversary = async () => {
    try {
      const items = await EmployeeModal.find();
      const today = moment().startOf("day");

      const birthdaysToday = items
        .filter((employee) => {
          const employeeDOB = moment(
            employee.personalInfo.employeeDOB,
            "DD-MM-YYYY"
          );
          return (
            employeeDOB.date() === today.date() &&
            employeeDOB.month() === today.month()
          );
        })
        .map((employee) => ({
          name: employee.personalInfo.employeeName,
          dob: employee.personalInfo.employeeDOB,
          employeeId: employee.personalInfo.employeeId,
        }));

      const anniversariesToday = items
        .filter((employee) => {
          const employeeDOJ = moment(
            employee.personalInfo.employeeDOJ,
            "DD-MM-YYYY"
          );
          return (
            employeeDOJ.date() === today.date() &&
            employeeDOJ.month() === today.month()
          );
        })
        .map((employee) => ({
          name: employee.personalInfo.employeeName,
          doj: employee.personalInfo.employeeDOJ,
          employeeId: employee.personalInfo.employeeId,
        }));

      const TodayBirthday = birthdaysToday;
      const TodayAnniversary = anniversariesToday;

      const nameStringforBirthday = TodayBirthday.map(
        (value) => value.name
      ).join(", ");
      const nameStringforAnniversary = TodayAnniversary.map(
        (value) => value.name
      ).join(", ");

      const storebirthdayData = {
        typeofNotification: "Birthday",
        message: `Today is ${nameStringforBirthday} Birthday`,
        date: moment().format("DD-MM-YYYY"),
        time: moment().format("hh:mm a"),
      };
      const storeAnniversaryData = {
        typeofNotification: "Anniversary",
        message: `Today is ${nameStringforAnniversary} work Anniversary`,
        date: moment().format("DD-MM-YYYY"),
        time: moment().format("hh:mm a"),
      };

      const findisBirthdayMessageExist = await NotificationModal.findOne({
        typeofNotification: "Birthday",
        date: moment().format("DD-MM-YYYY"),
        time: moment().format("hh:mm a"),
      });
      const findisAnniversaryMessageExist = await NotificationModal.findOne({
        typeofNotification: "Anniversary",
        date: moment().format("DD-MM-YYYY"),
        time: moment().format("hh:mm a"),
      });

      if (TodayBirthday?.length > 0 && !findisBirthdayMessageExist) {
        await NotificationModal.create(storebirthdayData);
        io.emit("todaybirthday", TodayBirthday);
        console.log("Broadcast for BirthDay sent successfully");
      } else {
        console.log("No Birthday today or already exists");
      }

      if (TodayAnniversary?.length > 0 && !findisAnniversaryMessageExist) {
        await NotificationModal.create(storeAnniversaryData);
        io.emit("todayanniversary", TodayAnniversary);
        console.log("Broadcast for Anniversary sent successfully");
      } else {
        console.log("No Anniversary today or already exists");
      }
    } catch (err) {
      console.error("Error fetching employee data:", err.message);
    }
  };

  // */2 * * * *

  //   cron.schedule("*/2 * * * *", employeeBirthdayAnniversary, {
  //     timezone: "Asia/Kolkata",
  //   });

  cron.schedule("0 10 * * *", employeeBirthdayAnniversary, {
    timezone: "Asia/Kolkata",
  });

  socket.on("disconnect", () => {
    console.log("Some one is Disconnected");
    return () => socket.removeAllListeners();
  });
});

// Specify the allowed origin

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.DATABASE_URL)
  // .connect(
  //   "mongodb+srv://tecorbportal:Bond0007@tecorbportal.b69rzkk.mongodb.net/"
  // )
  .then(() => {
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    );
  })
  .catch((err) => {
    console.log({ err });
    process.exit(1);
  });

export const handler = serverless(api);
