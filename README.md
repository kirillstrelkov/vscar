# README

This repository contains code for car comparision app.

## Trello board

<https://trello.com/b/mAuFjNDq>

## Initial database

[./db/db.zip](./db/db.zip)

## Prototype

Preview - <https://invis.io/5CXW45SJ2D6>

## Live Demo

- Frontend: <https://vscar.vercel.app>
- Backend: <https://vscar-back.herokuapp.com>
- MongoDB: `mongodb+srv://cluster0.zsfsj.mongodb.net/vscar`

## Dev

### Prerequisites

#### nodejs

For Ubuntu use snap and specify proper version for node:

```bash
sudo snap install node --classic --channel=14
```

#### Angular CLI

```bash
npm install -g @angular/cli
```

_NOTE: if not installed globally create alias for `ng`:_

```bash
alias ng=./node_modules/.bin/ng
```

#### Local MongoDB

Mongodb should be up and running. Use `docker` to start mongodb backend + `MongoDB Compass` for UI.

Start MongoDB in Docker:

```
docker run --name mongodb -d -p 27017:27017 mongo
```

Set `DATABASE_URI` environment variable to `mongodb://127.0.0.1:27017/vscar`

#### Cloud MongoDB

[MongoDB Atlas](https://www.mongodb.com/cloud/atlas) is used as cloud database service.

Set `DATABASE_URI` environment variable to `mongodb+srv://user:user@cluster0.zsfsj.mongodb.net/vscar`

**NOTE**: `.env` file can be use:

```bash
DATABASE_URI=mongodb+srv://user:user@cluster0.zsfsj.mongodb.net/vscar
PORT=3000
```

### Backend

> NOTE: before running mongodb should be up and running

Set `PORT` env variable to 3000 or use `.env` file.

Initialize db:

```bash
cd back
npm run resetdb
```

Start backend:

```bash
cd back
npm run start
```

#### Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

#### Installation

```bash
cd front
npm install

cd back
npm install
```

#### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

#### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Frontend

Start frontend:

```bash
cd front
ng serve
```

#### Frontend part

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.0.

#### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

#### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Deployment

#### Database

Use [MongoDB Compass](https://www.mongodb.com/products/compass) to access database with uri: `mongodb+srv://<username>:<password>@cluster0.zsfsj.mongodb.net/vscar`.

For better performance, indexes for next keys should be created:

- adac_id
- name
- price
- attributes.name
- attributes.value

#### Backend

To push only backend part use next command:

`git subtree push --prefix back/ heroku master`

Set `DATABASE_URI` config value to `mongodb+srv://<username>:<password>@cluster0.zsfsj.mongodb.net/vscar`

#### Frontend

Angular frontend is attached to [Vercel](https://vercel.com/) via GitHub. For any commit new version will be built.

In `General` -> `Build & Development Settings` use: `ng build --prod` to use production environment.
