node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

demo-build:
	@webpack
	@node-sass demo/src/demo.scss public/main.css --include-path bower_components
	@$(DONE)

demo: demo-build
	@node demo/app

a11y: demo-build
	@node .pa11yci.js
	@PA11Y=true node demos/app
	@$(DONE)

test:
	make verify
	make unit-test
	make a11y
