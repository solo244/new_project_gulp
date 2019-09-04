# New projects with Gulp v1.5

## Set up
1. Clone files to a new directory
2. `cd` to the this directory via command line/terminal
3. Run `yarn` to get your node_modules (default **.gitignore**)
4. Check `package.json` and make changes in **general info, paths, vars and url** where needed
5. Run **gulp commands** to start developing

## Gulp commands
- To run an active watch with BrowserSync, run `gulp watch`
- To only run the JS files: `gulp script`
- To only run the SASS files: `gulp style`
- To only run the Pug files: `gulp pug`
- To only run the image files: `gulp images`
- To only run the favicon files: `gulp favicon`
- To only run the font files: `gulp font`

## Organisation
- **dev:** Add any and all `development` content here. `Pug` for html templates
  - **css:** Contains all modular files, loading in in the `main.scss` file
  - **favicon:** Contains all favicon files. Will just copy/paste everything over.
  - **images:** Contains all images. Using subfolder is allowed. Optimization will happen later
  - **js:** Contains all js files via requires in the `main.js` file
  - **views:**: All files and folders are copied from this location, from `Pug` to `HTML` format, **excluding** files from the  *_layout* folder
- **build:** All dev changes are tracked in the *build* folder. These files are compiled for web friendly viewing. This is the working test directory when running a local server.
- **dist:** All build files are compiled for final host purposes in the *dist* folder. These files (css, js, html & images) are optimized for the web (minified & concatenated). Paths are changed where needed to fit the need of the server. Before upload this folder is emptied and after upload this folder is deleted.

## Don't forgets..
- Replace the Google key in your `package.json` file when going live
- Leave the `$path` var to it's default value if your site exists in the root

## To publish via Netlify
- Setup the website on Netlify and verify all details. Add those A records to your hosting company.
- Simply push to master branch to trigger the gulp command `gulp publish` and let Netlify do all the rest

## For more information
- [Source and writer](http://kenvandamme.be/) or [on Github as solo244](https://github.com/solo244)

## Version 1.1
- Added vendor concat & minify in Gulp build

## Version 1.2
- Added Gulp ftp and replaced jade with pug

## Version 1.3
- Moved a lot of info to the package file (cleaning up the Gulpfile)
- Added critical gulp module for above the fold content
- Added Google code via package file (1.3.2)

## Version 1.4
- Added new CSS structure
- Added stylelinter
- Load in CSS with preload attribute
- Preconnect font if from Google Webfonts (1.4.2)

## Version 1.5
- Updated to Gulp v4
