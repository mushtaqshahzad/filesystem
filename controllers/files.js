import { promises as fs, existsSync } from 'fs';
import path from 'path';

const getFiles = async (req, res, next) => {
  let { directory } = req.query;

  if (!directory) {
    directory = 'uploads';
  }

  console.log(path.join(path.resolve('.'), directory));
  try {
    const listArray = await fs.readdir(path.resolve('.', directory));
    let result = { count: {}, items: [] };
    for (const item of listArray) {
      const itemPath = path.join(directory, item);

      const stats = await fs.stat(itemPath);
      if (stats.isDirectory()) {
        result['items'].push({ name: item, is: 'directory', path: itemPath });
      } else {
        if (stats.isFile) result['items'].push({ name: item, is: 'file', path: itemPath });
      }
    }
    result.count.folderCount = result.items.filter((item) => item.is === 'directory').length;

    result.count.filesCount = result.items.filter((item) => item.is === 'file').length;

    return res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send('Directory Not Found');
  }
};

const deleteFile = async (req, res, next) => {
  const { filePath } = req.query;

  try {
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      res.send(`Deleted ${filePath}`);
    } else {
      res.status(400).send('File Not Found');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const deleteFolder = async (req, res, next) => {
  const { folderPath } = req.query;

  try {
    if (existsSync(folderPath)) {
      await fs.rmdir(folderPath, { recursive: true });
      res.send(`Deleted ${folderPath}`);
    } else {
      res.status(400).send('Folder Not Found');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const moveFile = async (req, res, next) => {
  const { filePath, destination } = req.query;

  const destinationFolder = destination.split('\\').slice(0, -1).join('\\');

  if (!existsSync(destinationFolder)) {
    await fs.mkdir(destinationFolder, { recursive: true }, (err) => err && res.status(500).send('An error occurred'));
  }

  try {
    if (existsSync(filePath)) {
      await fs.rename(filePath, destination);
      return res.send(`Moved ${filePath} to ${destination}`);
    }
    return res.status(400).send('File Not Found');
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const moveFolder = async (req, res, next) => {
  const { oldPath, destination } = req.query;

  // if (!existsSync(destination)) {
  //   await fs.mkdir(destination, { recursive: true }, (err) => err && res.status(500).send('An error occurred'));
  // }

  try {
    if (existsSync(oldPath)) {
      await fs.rename(oldPath, destination);
      return res.send(`Moved ${oldPath} to ${destination}`);
    }
    return res.status(400).send('File Not Found');
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const copyFile = async (req, res, next) => {
  const { filePath, destination } = req.query;

  const destinationFolder = destination.split('\\').slice(0, -1).join('\\');

  if (!existsSync(destinationFolder)) {
    await fs.mkdir(destinationFolder, { recursive: true }, (err) => err && res.status(500).send('An error occurred'));
  }

  try {
    if (existsSync(filePath)) {
      await fs.copyFile(filePath, destination);
      return res.send(`Copied ${filePath} to ${destination}`);
    }
    return res.status(400).send('File Not Found');
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const copyFolder = async (req, res, next) => {
  const { oldPath, destination } = req.query;

  if (!existsSync(destination)) {
    await fs.mkdir(destination, { recursive: true }, (err) => err && res.status(500).send('An error occurred'));
  }

  try {
    if (existsSync(oldPath)) {
      await fs.cp(oldPath, destination, { recursive: true });
      return res.send(`Copied ${oldPath} to ${destination}`);
    }
    return res.status(400).send('File Not Found');
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const searchFiles = async (req, res, next) => {
  const { search } = req.query;

  if (!search) return res.status(400).send('Please provide a search query');

  let { directory } = req.query;
  directory = directory || 'uploads';

  try {
    const filesList = await walkDirectory(directory);
    console.log(filesList);
    const filteredList = filesList.filter((item) => item.name.includes(search));

    console.log(filteredList);

    const result = { count: { filesCount: 0, foldersCount: 0 }, items: filteredList };

    console.log(result);

    result.count.foldersCount = result.items.filter((item) => item.is === 'directory').length;

    result.count.filesCount = result.items.filter((item) => item.is === 'file').length;

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

const walkDirectory = async (dir, result = []) => {
  const listArray = await fs.readdir(path.join(dir));

  for (const item of listArray) {
    const itemPath = path.join(dir, item);
    const stats = await fs.stat(itemPath, (err, stats) => err);

    if (stats.isDirectory()) {
      result.push({ name: item, is: 'directory', path: itemPath });
      await walkDirectory(itemPath, result);
    } else {
      if (stats.isFile()) {
        result.push({ name: item, is: 'file', path: itemPath });
      }
    }
  }
  return result;
};

const downloadFile = async (req, res, next) => {
  const { filePath } = req.query;

  const formattedFilePath = path.join(path.resolve('.'), filePath);

  console.log(formattedFilePath);

  try {
    res.download(formattedFilePath, (err) => err && res.status(500).send('An error occurred'));
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred');
  }
};

export { getFiles, deleteFile, moveFile, copyFile, searchFiles, downloadFile, copyFolder, moveFolder, deleteFolder };
