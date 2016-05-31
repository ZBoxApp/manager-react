.PHONY: build install test run run-fullmap clean stop nuke stop-server start-server

test: | install
	@echo Checking for SCSS style guide compliance

	@scss-lint ./src/sass/**/*.scss

	@echo Checking for JS style guide compliance

	@npm run check

install: package.json
	@echo Getting scss-lint using gem

	#@gem install scss_lint

	@echo Getting dependencies using npm

	@npm install

build: | install test
	@echo Building ZBox Manager Webapp

	@npm run build

run: | install start-server
	@echo Running ZBox Manager Webapp for development

	@npm run run &

run-fullmap: | install start-server
	@echo FULL SOURCE MAP Running ZBox Manager Webapp for development FULL SOURCE MAP

	@npm run run-fullmap &

stop: | stop-server
	@echo Stopping changes watching

	@for PROCID in $$(ps -ef | grep "[n]ode.*[w]ebpack" | awk '{ print $$2 }'); do \
		echo stopping webpack watch $$PROCID; \
		kill $$PROCID; \
	done

clean:
	@echo Cleaning Webapp

	@rm -rf dist
	@rm -f .npminstall

nuke: clean
	@rm -rf node_modules

stop-server:
	@echo Stopping ZBox Manager 2.0 Test Server

	@for PROCID in $$(ps -ef | grep "[b]abel-node.*server" | awk '{ print $$2 }'); do \
		echo stopping server $$PROCID; \
		kill $$PROCID; \
	done

	@for PROCID in $$(ps -ef | grep "[b]abel-node.*sales" | awk '{ print $$2 }'); do \
  	echo stopping server $$PROCID; \
  	kill $$PROCID; \
  done

start-server:
	@echo Starting ZBox Manager 2.0 Test Server
	@npm run server &
	@npm run sales-service &
