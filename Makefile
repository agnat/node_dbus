all: lib/signature_parser.js


%.js : %.pegjs
	pegjs 'module.exports' $< $@
