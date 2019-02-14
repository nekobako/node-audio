const stream = require('stream');
const cp = require('child_process');

class Mic extends stream.Readable {
	constructor(options) {
		super(options);

		this._options = Object.assign({
			buffer: 1024,
			encoding: 'signed-integer',
			endian: 'little',
			bits: 16,
			channels: 1,
			rate: 16000,
			device: 0
		}, options || {});

		this._process = cp.spawn('sox', [
			'--buffer', this._options.buffer,
			'--encoding', this._options.encoding,
			'--endian', this._options.endian,
			'--bits', this._options.bits,
			'--channels', this._options.channels,
			'--rate', this._options.rate,
			'--type', 'waveaudio',
			this._options.device,
			'--type', 'raw',
			'-'
		]);

		this._process.stdout.on('data', data => {
			if(this.readableFlowing !== null) {
				this.push(data);
			}
		});
	}

	_read(size) {
	}

	_destroy(error, callback) {
		this._process.kill();
		callback();
	}
}

class Speaker extends stream.Writable {
	constructor(options) {
		super(options);

		this._options = Object.assign({
			buffer: 1024,
			encoding: 'signed-integer',
			endian: 'little',
			bits: 16,
			channels: 1,
			rate: 16000,
			device: 0
		}, options || {});

		this._process = cp.spawn('sox', [
			'--buffer', this._options.buffer,
			'--encoding', this._options.encoding,
			'--endian', this._options.endian,
			'--bits', this._options.bits,
			'--channels', this._options.channels,
			'--rate', this._options.rate,
			'--type', 'raw',
			'-',
			'--type', 'waveaudio',
			this._options.device
		]);
	}

	_write(chunk, encoding, callback) {
		this._process.stdin.write(chunk, encoding, callback);
	}

	_final(callback) {
		this._process.stdin.end();
		callback();
	}

	_destroy(error, callback) {
		this._process.kill();
		callback();
	}
}

module.exports.Mic = Mic;
module.exports.Speaker = Speaker;
