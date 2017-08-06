# New projects with Gulp v1.2

## Set up
1. Clone files to a new directory
2. `cd` to the this directory via command line/terminal
3. Run `yarn install` to get your node_modules (default **.gitignore**)
4. Check `gulpfile.js` and look at **//Change** comments (settings at the top)
5. Run `gulp` to start developing

## Organisation
- **Dev:** Add any and all `development` content here. `Pug` for html templates
  - **Content:**: All files and folders are copied from this location, from `Pug` to `HTML` format, **excluding** files from the  *_layout* folder
  - **CSS/modules:** Contains all modular files -> `main.scss`
  - **CSS/pages:** Contains all files for custom/specific pages -> `main.scss`
  - **CSS/template:** Contains all basic template files -> `main.scss`
  - **images:** Contains all images. Using subfolder is allowed. Optimization will happen later
  - **JS/vendor:** Contains all vendor files -> `vendor.js`
  - **JS/main:** Contains all custom files -> `main.js`
- **Build:** All dev changes are tracked in the *build* folder. These files are compiled for web friendly viewing. This is the working test directory when running a local server.
- **Dist:** All build files are compiled for final host purposes in the *dist* folder. These files (css, js, html & images) are optimized for the web (minified & concatenated)

## To publish via FTP
- Open/create `.ftppass` (on root) and edit/add any server with the specific name: `ServerA` (= the default server name). But don't forget that this file needs to be in the same location as your **Gulpfile.js**. You can choose a different name by changing it in the **Gulpfile.js**. Make sure it remains in the **.ignore** for privacy reasons.
- Run `gulp ftp` (make sure to test and backup remote files _if needed_ first)
- _If creating an .ftppass file, you could use this code to set it up:_
```json
{
  "ServerA": {
    "username": "putyourownusernamehere",
    "password": "putyourpasswordhere"
  },
  "anotherServerifYouNeedItButItsOptional": {
    "username": "putyourownusernamehere",
    "password": "putyourpasswordhere"
  }
}
```

## For more information
- [Source and writer](http://kenvandamme.be/) or [on Github as solo244](https://github.com/solo244)

## Requirements/used
- jQuery
- SASS for `css`
- Pug for `html`
- Gulp

## Browser compatibility
- Internet Explorer 11+
- Firefox
- Chrome
- Opera
- Safari

## Version 1.1
- Added vendor concat & minify in Gulp build

## Version 1.2
- Added Gulp ftp and replaced jade with pug
