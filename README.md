# New projects with Gulp

## Set up
1. Clone files to a new directory
2. `cd` to the this directory via command line/terminal
3. Run `npm install` to get your node_modules (default **.gitignore**)
4. Check `gulpfile.js` and look at **//Change** comments (settings at the top)
5. Run `gulp` to start developing

## Organisation
- **Dev:** Add any and all `development` content here. `Jade` for html templates
  - **Content:**: All files and folders are copied from this location, from `jade` to `html` format, **excluding** files from the  *_template* folder
  - **CSS/modules:** Contains all modular files -> `main.scss`
  - **CSS/pages:** Contains all files for custom/specific pages -> `main.scss`
  - **CSS/template:** Contains all basic template files -> `main.scss`
  - **images:** Contains all images. Using subfolder is allowed. Optimization will happen later
  - **JS/vendor:** Contains all vendor files -> `main.js`
  - **JS/main:** Contains all custom files -> `main.js`
- **Build:** All dev changes are tracked in the *build* folder. These files are compiled for web friendly viewing. This is the working test directory when running a local server.
- **Dist:** All build files are compiled for final host purposes in the *dist* folder. These files (css, js, html & images) are optimized for the web (minified & concatenated)

## When using `dist` to go live
- Run `gulp dist` and upload to host

## For more information
- [Source and writer](http://kenvandamme.be/) or [on Github as solo244](https://github.com/solo244)

## Requirements/used
- jQuery
- SASS for `css`
- Jade for `html`
- Gulp
- Modernizr for that one browser that we all know

## Browser compatibility
- Internet Explorer 9+
- Firefox
- Chrome
- Opera
- Safari
