```vb
list1 = [
	{
		"lib": "module.so",
		"mls": ["0x456", "0x567"],
	}, {
		"lib": "hello.so", "mls": ["0x678", "0x789"],
	},
];
```

the above script is valid JSON for GreyHack script -- interestingly, you can multi-line as long as there's leading commas at end of everything.. Also semi-colon is valid??! interesting. Unneccesary but intersting.

set_group MUST be called before set_owner if not doing so as root user -- you cannot set_group as non-owner

Found out that you can create folders via `computer.create_folder` that have an underscore character in their name, but you cannot **use** underscores for folder paths elsewhere - thus creating all kinds of problems.