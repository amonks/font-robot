font robot

based on Jon Gold's article, _Taking The Robots To Design School_ http://www.jon.gold/2016/05/robot-design-school/

* * *

- **the page where you can compare fonts:** https://amonks.github.io/font-robot/
- the _huge_ json file that comparator looks at: https://amonks.github.io/font/robot.analysis.json
- the page that analyzes a bunch of vector fonts and generates the above json file: https://amonks.github.io/font-robot/analyze

* * *

this is some gulp scripts for gathering a big pile of fonts, plus a browser program for analyzing a big pile of fonts, plus another browser program for looking at data about a big pile of fonts

first run `npm install`, then:

- download a big pile of fonts, like [this one](https://github.com/google/fonts) into `./in`
- run `npm run import` to gather up all the `.ttf` files in `./in/`, copy them into `./fonts`, delete everything else in `./in`, and make a list called `./fonts.json`
- run `npm start` and visit `localhost:8000` to analyze all the fonts on `./fonts.json`. It'll download a file called `analysis.json`
- run `npm start` and visit `localhost:8000/` with an `analysis.json` in this folder to explore the analysis. click a font to see similar fonts.

