import_code("/home/usr/Src/includelib.src")
import_code("/home/usr/Src/hackutils.src")

if params.len != 2 or params[0] == "-h" or params[0] == "--help" then exit("<b>Usage: "+program_path.split("/")[-1]+" [ip_address] [port]</b>")

address = params[0]
port = params[1].to_int

remoteRes = get_remote_hacks(address, port)
hacks = remoteRes.hacks
dump = remoteRes.dump
shell = null

for hack in hacks
	values = hack.values
	for value in values
		result = dump.overflow(hack.memory, value, "pass")
		print(result)

		if not result then continue

		if typeof(result) == "shell" then
			shell = result
			break
		end if

	end for
	if shell != null then break
end for

if shell != null then
	upload_hacks(shell)
	shell.start_terminal
end if

