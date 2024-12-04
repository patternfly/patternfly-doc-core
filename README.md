# Patternfly Documentation Core

Patternfly documentation core contains the base packages needed to build and release the PatternFly org website.

## Development

The website is built using [Astro](https://astro.build). Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

The `src/components/` folder contains  Astro and React components that can be used to build the websites pages.

Any static assets, like images, can be placed in the `public/` directory.

To define the markdown schema this project uses a typescript based schema known as [Zod](https://zod.dev). Details of how this is integratred into Astro can be found in Astros documentation on [content creation using Zod](https://docs.astro.build/en/guides/content-collections/#defining-datatypes-with-zod).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
