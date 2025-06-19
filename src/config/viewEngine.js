import express from "express";
// cấu hình engine hiển thị giao diện cho express
let configViewEngine = (app) => {
    app.use(express.static("./src/public"));
    app.set("view engine", "ejs");
    app.set("views", "./src/views")

}

module.exports = configViewEngine;