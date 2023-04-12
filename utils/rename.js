import fs from "fs";
import path from "path";

export const rename = (file, splittedName) => {
  fs.rename(
    `${path.resolve()}/uploads/${file.filename}`,
    `${path.resolve()}/uploads/${file.filename}.${
      splittedName[splittedName.length - 1]
    }`,
    (err) => {
      if (err) {
        return next(new ErrorHandler(err.message, 404));
      }
    }
  );
};
