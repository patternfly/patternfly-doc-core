# Patternfly Documentation Core

Patternfly documentation core contains the base packages needed to build and release the PatternFly org website.

## Consuming this repo as a package

### Setup

Using this package for your documentation is accomplished in just a few simple steps:

1. Run `npx patternfly-doc-core@latest setup` from the root of your repo. This will:
   - add the documentation core as a dependency in your package
   - add the relevant scripts for using the documentation core to your package scripts
   - create the configuration file for customizing the documentation core
1. Install the documentation core using your projects dependency manager, e.g. `npm install` or `yarn install`
1. Run the initialization script using your script runner, e.g. `npm run init:docs` or `yarn init:docs`
   - this will update a Vite config in the documentation so that it can access the files in your repo when running the development server
1. Edit the `pf-docs.config.js` file in your project root to point the documentation core to your documentation files

### Use

Once setup is complete you can start the dev server with the `start` script, and create production builds using the `build:docs` script!

## Running this repo directly

### Development

The website is built using [Astro](https://astro.build). Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

The `src/components/` folder contains Astro and React components that can be used to build the websites pages.

Any static assets, like images, can be placed in the `public/` directory.

To define the markdown schema this project uses a typescript based schema known as [Zod](https://zod.dev). Details of how this is integratred into Astro can be found in Astros documentation on [content creation using Zod](https://docs.astro.build/en/guides/content-collections/#defining-datatypes-with-zod).

### 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run build:cli`       | Create a JS build of the documentation core CLI  |
| `npm run build:cli:watch` | Run the CLI builder in watch mode                |
