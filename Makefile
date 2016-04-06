.PHONY: build test run run-fullmap clean stop nuke

test:
	@echo Checking for style guide compliance

	@npm run check

install: package.json
	@echo Getting dependencies using npm

	@npm install

	@touch $@

build: | install test
	@echo Building ZBox Manager Webapp

	@npm run build

run: install
	@echo Running ZBox Manager Webapp for development

	@npm run run &

run-fullmap: install
	@echo FULL SOURCE MAP Running ZBox Manager Webapp for development FULL SOURCE MAP

	@npm run run-fullmap &

stop:
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
