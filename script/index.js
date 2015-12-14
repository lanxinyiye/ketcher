var queryString = require('query-string');

var util = require('./util');
var api = require('./api.js');
var molfile = require('./chem/molfile');
var smiles = require('./chem/smiles');

require('./ui');
require('./rnd');

var ui = global.ui;
var rnd = global.rnd;

function getSmiles(forceLocal) {
	var local = ui.standalone || forceLocal;
	var saver = local ? smiles : molfile;
	var mol = saver.stringify(ui.ctab, { ignoreErrors: true });
	// TODO: Remove me. Remains here for getSmiles api compatibility
	return local ? mol : ketcher.server.smiles.sync({
		moldata: mol
	});
};

function getMolfile() {
	return molfile.stringify(ui.ctab, { ignoreErrors: true });
};

function setMolecule(molString) {
	if (!Object.isString(molString)) {
		return;
	}
	ui.loadMolecule(molString);
};

function addFragment(molString) {
	if (!Object.isString(molString)) {
		return;
	}
	ui.loadFragment(molString);
};

function showMolfile(clientArea, molString, options) {
	var opts = util.extend({
		bondLength: 75,
		showSelectionRegions: false,
		showBondIds: false,
		showHalfBondIds: false,
		showLoopIds: false,
		showAtomIds: false,
		autoScale: false,
		autoScaleMargin: 4,
		hideImplicitHydrogen: false
	}, options);
	var render = new rnd.Render(clientArea, opts.bondLength, opts);
	if (molString) {
		var mol = molfile.parse(molString);
		render.setMolecule(mol);
	}
	render.update();
	// not sure we need to expose guts
	return render;
};

function onStructChange(handler) {
	util.assert(handler);
	ui.render.addStructChangeHandler(handler);
};

// TODO: replace window.onload with something like <https://github.com/ded/domready>
// to start early
window.onload = function () {
	var params = queryString.parse(document.location.search);
	if (params.api_path)
		ketcher.api_path = params.api_path;
	ketcher.server = api(ketcher.api_path);
	ui.init(util.extend({}, params), ketcher.server);
};

var ketcher = module.exports = {
	version: '__VERSION__',
	api_path: '__API_PATH__',
	build_date: '__BUILD_DATE__',
	build_number: '__BUILD_NUMBER__' || null,
	build_options: '__BUILD_OPTIONS__',

	getSmiles: getSmiles,
	getMolfile: getMolfile,
	setMolecule: setMolecule,
	addFragment: addFragment,
	showMolfile: showMolfile,
	onStructChange: onStructChange
};
