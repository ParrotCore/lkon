const { join: join_paths } = require("node:path");

module.exports = function getRelativeLocation(path)
{
    let location = process.argv[process.argv.length-1];
        location = join_paths(location, path)
    return location;
}