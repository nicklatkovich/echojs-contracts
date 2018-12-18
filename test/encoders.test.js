import 'mocha';
import { strictEqual, throws } from 'assert';
import BigNumber from 'bignumber.js';
import $c from 'comprehension';
import { encode } from '../src/encoders';

describe('encoders', () => {

	describe('boolean', () => {
		it('not a boolean', () => throws(
			() => encode({ value: 'not_a_boolean', type: 'bool' }),
			{ message: 'value is not a boolean' },
		));
		it('false', () => strictEqual(encode({ value: false, type: 'bool' }), $c(64, () => '0').join('')));
		it('true', () => strictEqual(encode({ value: true, type: 'bool' }), `${$c(63, () => '0').join('')}1`));
	});

	describe('integer', () => {
		describe('invalid bits count', () => {
			for (const { test, bitsCount, message } of [
				{ test: 'zero', bitsCount: 0, message: 'bits count is not positive' },
				{ test: 'greater than 256', bitsCount: 257, message: 'bits count is greater than 256' },
				{ test: 'not divisible to 8', bitsCount: 7, message: 'bits count is not divisible to 8' },
			]) it(test, () => {
				throws(() => encode({ value: 123, type: `uint${bitsCount}` }), { message });
				throws(() => encode({ value: 123, type: `int${bitsCount}` }), { message });
			});
		});
		describe('invalid value', () => {
			for (const { test, value, message } of [{
				test: 'simple number greater than MAX_SAFE_INTEGER',
				value: Number.MAX_SAFE_INTEGER * 2,
				message: 'loss of accuracy, use bignumber.js',
			}, {
				test: 'not a number',
				value: 'not_a_number',
				message: 'value is not a number',
			}, {
				test: 'decimal number',
				value: 1.23,
				message: 'value is not a integer',
			}, {
				test: 'decimal BigNumber',
				value: new BigNumber(1.23),
				message: 'value is not a integer',
			}]) it(test, () => {
				throws(() => encode({ value, type: `uint256` }), { message });
				throws(() => encode({ value, type: `uint256` }), { message });
			});
		});
		describe('unsigned', () => {
			it('negative value', () => throws(
				() => encode({ value: -123, type: 'uint64' }),
				{ message: 'value is negative' },
			));
			it('uint64 overloading', () => throws(
				() => encode({ value: new BigNumber(2).pow(64).plus(123), type: 'uint64' }),
				{ message: 'uint64 overloading' },
			));
			it('successful', () => strictEqual(encode({
				type: 'uint256',
				value: new BigNumber('115277457729594790111051606095322955253830667489157158755705222607339300572655'),
			}), 'fedcba98765432100123456789abcdeffedcba98765432100123456789abcdef'));
			it('padding on using not big number', () => strictEqual(
				encode({ type: 'uint128', value: 1234567899876543 }),
				'000000000000000000000000000000000000000000000000000462d53d1f8cbf',
			));
			it('different bounds of overloading with signed integer', () => strictEqual(
				encode({ type: 'uint64', value: new BigNumber(2).pow(63).plus(123) }),
				'000000000000000000000000000000000000000000000000800000000000007b',
			));
		});
		describe('signed', () => {
			it('int64 overloading', () => {
				for (const value of [
					new BigNumber(2).pow(63).plus(123),
					new BigNumber(2).pow(63).times(-1).minus(123),
				]) throws(() => encode({ type: 'int64', value }), { message: 'int64 overloading' });
			});
			it('positive', () => strictEqual(encode({
				type: 'int256',
				value: new BigNumber('15277457729594790111051606095322955253830667489157158755705222607339300572655'),
			}), '21c6bc11c65958fdb73436b075b82f3154443f2a068192100123456789abcdef'));
			it('negative', () => strictEqual(encode({
				type: 'int256',
				value: new BigNumber('-15277457729594790111051606095322955253830667489157158755705222607339300572655'),
			}), 'de3943ee39a6a70248cbc94f8a47d0ceabbbc0d5f97e6deffedcba9876543211'));
			it('padding on using not big number', () => strictEqual(
				encode({ type: 'int128', value: -1234567899876543 }),
				'00000000000000000000000000000000fffffffffffffffffffb9d2ac2e07341',
			));
		});
	});

	describe('address', () => {
		it('not a string', () => throws(
			() => encode({ type: 'address', value: 123 }),
			{ message: 'address is not a string' },
		));
		it('invalid format', () => {
			for (const invalidAddress of ['.2.0', '116.123', '1.16123', '1.16.', '1.16.0123']) {
				throws(() => encode({ type: 'address', value: invalidAddress }), { message: 'invalid address format' });
			}
		});
		it('objectId gt 2**152', () => throws(
			() => encode({ type: 'address', value: `1.16.${new BigNumber(2).pow(152).plus(123).toString(10)}` }),
			{ message: 'objectId is greater or equals to 2**152' },
		));
		it('objectId eqt 2**152', () => throws(
			() => encode({ type: 'address', value: `1.16.${new BigNumber(2).pow(152).toString(10)}` }),
			{ message: 'objectId is greater or equals to 2**152' },
		));
		describe('successful', () => {
			it('account', () => strictEqual(
				encode({ type: 'address', value: '1.2.123' }),
				'000000000000000000000000000000000000000000000000000000000000007b',
			));
			it('contract', () => strictEqual(
				encode({ type: 'address', value: '1.16.321' }),
				'0000000000000000000000000100000000000000000000000000000000000141',
			));
			it('preoverloading', () => strictEqual(
				encode({ type: 'address', value: '1.16.5708990770823839524233143877797980545530986495' }),
				'00000000000000000000000001ffffffffffffffffffffffffffffffffffffff',
			));
		});
	});

	describe('static bytes', () => {
		it('not a hex string', () => throws(
			() => encode({ type: 'bytes10', value: 'qwe' }),
			{ message: 'input is not a hex string' },
		));
		it('large input', () => throws(
			() => encode({ type: 'bytes2', value: '0x012345' }),
			{ message: 'input is too large' },
		));
		it('short input', () => throws(
			() => encode({ type: 'bytes3', value: '0x0123' }),
			{ message: 'input is too short, maybe u need to use align?' },
		));
		it('unknown align', () => throws(() => encode({
			type: 'bytes3',
			value: { value: '0x12', align: 'qwe' },
		}), { message: 'unknown align' }));
		describe('invalid bytes count', () => {
			for (const { test, bytesCount, error } of [
				{ test: 'zero', bytesCount: 0, error: 'bytes count is not positive' },
				{ test: 'gt 32', bytesCount: 33, error: 'bytes count is grater than 32' },
			]) it(test, () => throws(
				() => encode({ type: `bytes${bytesCount}`, value: Buffer.from([]) }),
				{ message: error },
			));
		});
		for (const { test, input } of [
			{ test: 'hex string without align', input: '0x01234500' },
			{ test: 'hex string as object', input: { value: '0x01234500' } },
			{ test: 'hex without 0x', input: '01234500' },
			{ test: 'buffer', input: Buffer.from([1, 35, 69, 0]) },
			{ test: 'ascii', input: { value: '\x01#E\0', encoding: 'ascii' } },
			{ test: 'utf8', input: { value: '\x01#E\0', encoding: 'utf8' } },
			{ test: 'utf16le', input: { value: '⌁E', encoding: 'utf16le' } },
		]) it(test, () => strictEqual(
			encode({ type: 'bytes4', value:  input }),
			'0000000000000000000000000000000000000000000000000000000001234500',
		));
	});

	describe('arrays', () => {
		it('multidimensional arrays', () => strictEqual(encode([
			{ value: 1, type: 'uint256' },
			{ value: [[[], [1]], [[2, 3], [4, 5, 6]]], type: 'uint256[][2][]' },
			{ value: 4, type: 'uint256' },
		]), [
			'0000000000000000000000000000000000000000000000000000000000000001',
			'0000000000000000000000000000000000000000000000000000000000000060',
			'0000000000000000000000000000000000000000000000000000000000000004',
			'0000000000000000000000000000000000000000000000000000000000000002',
			'0000000000000000000000000000000000000000000000000000000000000100',
			'0000000000000000000000000000000000000000000000000000000000000120',
			'0000000000000000000000000000000000000000000000000000000000000160',
			'00000000000000000000000000000000000000000000000000000000000001c0',
			'0000000000000000000000000000000000000000000000000000000000000000',
			'0000000000000000000000000000000000000000000000000000000000000001',
			'0000000000000000000000000000000000000000000000000000000000000001',
			'0000000000000000000000000000000000000000000000000000000000000002',
			'0000000000000000000000000000000000000000000000000000000000000002',
			'0000000000000000000000000000000000000000000000000000000000000003',
			'0000000000000000000000000000000000000000000000000000000000000003',
			'0000000000000000000000000000000000000000000000000000000000000004',
			'0000000000000000000000000000000000000000000000000000000000000005',
			'0000000000000000000000000000000000000000000000000000000000000006',
		].join('')));
	});
});
