# Grey Hack

**LEGAL NOTICE**
These files are for the video game [Grey Hack](https://store.steampowered.com/app/605230/Grey_Hack/)  
They are in no way real hacks - would not work under real life circumstances - and cannot cause harm  
Please do not assume you can hack information technology systems in real-life based on events and circumstances within this game. This game is a fictional simplification for entertainment purposes. Real life has real consequences.  
  
If you are interested in real life hacks, please seek out "Ethical Hacking", "Offensive Security", or "Penetration Testing" courses at your local community college

# VS Code

* NOTE: In VSCode the extension for language highlighting is `greyscript` **_not_** `greyhack` (surprising to me anyway)

# Notes

```js
list1 = [
	{
		"lib": "module.so",
		"mls": ["0x456", "0x567"],
	}, {
		"lib": "hello.so", "mls": ["0x678", "0x789"],
	},
];
```

* the above script is valid JSON for GreyHack script -- interestingly, you can multi-line as long as there's leading commas at end of everything.. Also semi-colon is valid??! interesting. Unneccesary but intersting.

* set_group MUST be called before set_owner if not doing so as root user -- you cannot set_group as non-owner

* Found out that you can create folders via `computer.create_folder` that have an underscore character in their name, but you cannot **use** underscores for folder paths elsewhere - thus creating all kinds of problems.