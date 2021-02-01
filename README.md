# Skyderby

[![View performance data on Skylight](https://badges.skylight.io/status/WhKRVcRJzg2z.svg)](https://oss.skylight.io/app/applications/WhKRVcRJzg2z)
[![Code Climate](https://codeclimate.com/github/skyderby/skyderby/badges/gpa.svg)](https://codeclimate.com/github/skyderby/skyderby)
[![CircleCI](https://circleci.com/gh/skyderby/skyderby.svg?style=svg)](https://circleci.com/gh/skyderby/skyderby)

![Screenshot](https://user-images.githubusercontent.com/5262979/106431765-ccd37880-647e-11eb-940f-50d5c2ec11ec.png)

## About

Skyderby is GPS tracks visualization, online rankings and competition scoring. 
In addition to these is being used as dropzones, basejumping exits database. 

### Long story short

In April 2014 I finally got the GPS tracker. After a couple of wingsuit jumps with it I wanted to check my results and faced the problem - 
I haven't found out a tool to visualy represent my flight and display insights, all existing services (free or commercial) didn’t show any results at all 
or showed it in a very uncomfortable way.
So I decided to create a new application.

## Development

You'll need Ruby 3.0, Node.js 14 (I suggest [asdf](https://asdf-vm.com/#/)) and Docker.

1. Clone the repo
2. Run `bundle install` and `yarn install`
3. Setup database by `rails db:create`, `rails db:schema:load` and `rails db:seed`
4. Spin up [track scanner](https://github.com/skyderby/track-scanner) by `docker run -ti --rm -p 127.0.0.1:8000:80 skyderby/track-scanner`
5. Run tests `rspec` and `yarn test` to verify your setup
6. Check out storybook by `yarn storybook`

## Deployment

Currently the app is deployed on self-hosted VPS. To spin up your own instance see [Infrastructure repo](https://github.com/skyderby/infrastructure).
Alternatively, app can be easily deployed to Heroku.

## Have a feature request or need help?

Open an [issue](https://github.com/skyderby/skyderby/issues/new) and I'll do my best to help you shortly.

## Million Thanks to

- Alex and Svetlana Rubinshtein 
- Shane Dunn
- Aleksey Shatilov 
- Valeriy Salcutsan
- Antoine Laporte 
- Simon Repton
- Evgeniy Pavlov
- Egor Orlow
- Simon Perriard
- Aleksey Galda
- Flo Kas 
- Csaba Szörényi
- Aleksandr Zharikov
- Ekaterina Larina 
- Tatyana Holm
- Yulia Makoveeva
- Daniel Duarte
- Leonid Sigalov 
- Sergey Panteleev

## Licensing

Code released under AGPLv3 license.

**Note:**
Skyderby is using [Highcharts JS](http://shop.highsoft.com/highcharts.html) library which is licensed under [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/).
