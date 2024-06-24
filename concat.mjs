// SELF EXPLANATORY
// USED TO CREATE THE TOPICS FILE CONTAINING ALL OF THE TOPICS
// USED FOR THE API TO DOWNLOAD FILES

import * as crime from "./formatted/crime.json" assert { type: "json" };
import * as apt from "./formatted/apts.json" assert { type: "json" };
import * as archive from "./formatted/archive.json" assert { type: "json" };
import * as papers from "./formatted/papers.json" assert { type: "json" };
import fs from "fs";

let concattedArray = apt.default
	.concat(crime.default)
	.concat(archive.default)
	.concat(papers.default);
fs.writeFile("./topics.json", JSON.stringify(concattedArray), () => {});
