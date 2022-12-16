import_code("/home/usr/Src/includelib.src")
import_code("/home/usr/Src/hackutils.src")

mx = load_library("metaxploit.so")
if not mx then exit("<color=#ff0000>No metaxploit library found</color>")

crypto = load_library("crypto.so")
if not crypto then exit("<color=#ff0000>No crypto library found</color>")

if params.len != 2 or params[0] == "-h" or params[0] == "--help" then exit("<b>Usage: "+program_path.split("/")[-1]+" [ip_address] [port]</b>")

address = params[0]
port = params[1].to_int

remoteRes = get_remote_hacks(address, port)
hacks = remoteRes.hacks
dump = remoteRes.dump
shell = null
targetPc = null

for hack in hacks
	values = hack.values
	for value in values
		result = dump.overflow(hack.memory, value, "pass")
		print(result)

		if not result then continue

		if typeof(result) == "shell" then
			shell = result
			targetPc = result.host_computer
			break
		else if typeof(result) == "computer" then
			targetPc = result
		end if

	end for
	if shell != null then break
end for

if shell != null then
	upload_hacks(shell)
	shell.start_terminal
else
	shellBlock = get_shell_type(targetPc)
	print(shellBlock.owner)
	if shellBlock.owner == "root" then
		// Get root access.
		print("Getting root access...")
		if not crypto then exit("Error: Crypto not found on system.")
		file = targetPc.File("/etc/passwd")
		if not file then exit("Error: Cannot get passwd file.")
		if not file.has_permission("r") then exit("/etc/passwd: Permission denied.")
		if file.is_binary or file.is_folder then exit("File is either binary or a folder.")
		roothash = file.get_content.split("\n")[0].split(":")[1]
		if not roothash then exit("Error: Cannot get root hash.")
		password = crypto.decipher(roothash)
		if not password then exit("Error: Failed to decrypt root password.")
		print("User: root\nPass: " + password)
		get_shell("root", password).start_terminal
	else
		exit("Exploits yielded a computer, but it is not root. No shell to get into. No access to /etc/passwd. Nothing to do.")
	end if
end if

