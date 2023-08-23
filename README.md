# Hello!
As I can see you probably decided to give it a try... So I'm glad.

# How to use it?
Using this module is very simple:
```js
const lkon = require('lkon');

lkon.stringify({
	username: "Lena Krukov",
	age: 19e+27,
	eyes: [
		0x2345FF,
		0x5432FF
	],
	email: undefined,
	access: .9
}) /*Expecting:
`[
	@username => "Lena Krukov";
	@age => 1.9e+28;
	@eyes => [
		@* => 2311679;
		@* => 5518079;
	];
	@email => undefined;
	@access => 0.9;
];`*/

lkon.parse(
`[
	#This user is cool
	@token => "xxx.xxx:zzz.zzz";
	@session_start => 1633998600000;
	@test => /^User[0-9]+$/g;
	@cookies => [
		@username => "User1";
		@avatar => "/0x08764/2021-10-12-12.00.000.jpg";
	];
];`
) /*Expecting:
	{
		token: "xxx.xxx:zzz.zzz",
		session_start: 1633998600000,
		test: /^user[0-9]$/g,
		cookies: {
			username: "User1",
			avatar: "/0x08764/2021-10-12-12.00.00.jpg"
		}
	}
*/

lkon.parse(
`[
	@publicKey => "./private/public.key"utf8;
	@privateKey => "./private/private.key"utf8;
];`
) /* Expecting
	{
		publicKey: your-public-key-here,
		privateKey: your-private-key-here
	}
*/
```

# Remember
* Each line (except the ones ending with `[`) must end with `;`;
* Each object keys must start with `@`;
* An assignment mark is `=>`.
* If Object contains data beginning with `@*`, then the Object is an Array;
* If Object contains data beggining with `@<key>`, then the Object is an associative object;
* `True` and `False` values are case sensitive and must start with uppercase letter;
* You can write your own comments by starting line with `#`, they will be ignored;
* You can set RegExp values by putting them into / /, optionally you can add some flags, e.g. /^h(e)+ll(o)+$/i.
* Now you can read files easily by putting their paths in " " and adding flags, which are the encoding. E.g "/path/to/file.lkon"utf8!

# LKON supports these types of data:
* undefined
* Boolean
* null
* Infinity
* Number
* String
* NaN
* RegExp
* Files