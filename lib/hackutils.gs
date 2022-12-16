recurse_mkdir = function(fullPath)
	pc = get_shell.host_computer

	folders = fullPath.split("/")[1:]
	runningPath = ""
	for fold in folders
		safeFold = fold.replace("_", "")
		testFolder = pc.File(runningPath + "/" + safeFold)
		if not testFolder then
			pc.create_folder(runningPath, safeFold)
		end if
		runningPath = runningPath + "/" + safeFold
	end for
end function

obtain_mems = function(metaLib = null, localShell = null)
	mx = load_library("metaxploit.so")

	if not metaLib then
		print("<color=#FF0000>Usage Error: no metalib passed in to obtain_mems in hackerutils module</color>")
		return []
	end if

	if not localShell then localShell = get_shell

	localPc = localShell.host_computer

	soughtLibAndVer = metaLib.lib_name[0:-3] + "v" + metaLib.version
	print("Seeking '" + soughtLibAndVer + "' library cache")

	cachePath = current_path + "/cache/" + metaLib.lib_name[0:-3].replace("_", "") + "/" + metaLib.version

	hacks = []
	cacheFiles = localPc.File(cachePath)

	if cacheFiles and cacheFiles.is_folder then
		memAddresses = cacheFiles.get_files
		for memFile in memAddresses
			hIter = { "memory": memFile.name }
			values = []

			exploitContent = memFile.get_content
			if not exploitContent or exploitContent.len < 1 then continue
			exploitLines = exploitContent.split("\n")
			for line in exploitLines
				values.push(line)
			end for

			hIter.values = values
			hacks.push(hIter)
		end for
		if hacks.len > 0 then return hacks
	end if

	//' No cache of this lib found. Lets scan it
	recurse_mkdir(cachePath)
	print("No hacks obtained from cache... scanning now")
	addresses = mx.scan(metaLib)
	for mem in addresses
		cacheMemPath = cachePath + "/" + mem
		exploitFile = localPc.File(cacheMemPath)
		if not exploitFile then
			localPc.touch(cachePath, mem)
			exploitFile = localPc.File(cacheMemPath)
		end if

		hIter = {}
		values = []
		valueFileStr = ""
		data = mx.scan_address(metaLib, mem)

		//' Print entire object so we can analyze how to parse
		print("<color=#AAFFCC>" + data + "</color>")

		strings = data.split("Unsafe check: ")
		for string in strings
			if string == strings[0] then continue

			value = string[string.indexOf("<b>")+3:string.indexOf("</b>")]
			valueFileStr = valueFileStr + char(10) + value
			values.push(value)
		end for

		exploitFile.set_content(valueFileStr)

		hIter["memory"] = mem
		hIter["values"] = values
		hacks = hacks + [hIter]
	end for

	return hacks
end function

print_hacks = function(lib = 0)
	cacheFolderPath = parent_path(program_path) + "/cache"
	files = [cacheFolderPath]
	localPc = get_shell.host_computer
	cacheFolder = localPc.File(cacheFolderPath)
	cacheSubFolders = cacheFolder.get_folders

	libs = {}

	if lib != 0 then
		libFolder = localPc.File(cacheFolderPath + "/" + lib)
		if not libFolder then exit("lib folder given not functional")
		libs[lib] = {}
		for versionFolder in libFolder.get_folders
			files.push(versionFolder.path)
			libs[lib][versionFolder.name] = {}
			memFiles = versionFolder.get_files
			for memFile in memFiles
				libs[lib][versionFolder.name][memFile.name] = memFile.get_content[1:].split("\n")
				files.push(memFile.path)
			end for
		end for
	else
		for libFolder in cacheSubFolders
			files.push(libFolder.path)
			libSubFolders = libFolder.get_folders
			libs[libFolder.name] = {}
			for versionFolder in libSubFolders
				files.push(versionFolder.path)
				memFiles = versionFolder.get_files
				libs[libFolder.name][versionFolder.name] = {}
				for memFile in memFiles
					libs[libFolder.name][versionFolder.name][memFile.name] = memFile.get_content[1:].split("\n")
					files.push(memFile.path)
				end for
			end for
		end for
	end if

	indexI = 0
	for lib in libs.indexes
		print(indexI + ". " + lib)
		indexI = indexI + 1
	end for
	print("0. Exit")
	answer = user_input("Enter choice: ")
	answer = answer.val
	if answer > 0 and answer < libs.indexes.len then
		libChoice = libs[libs.indexes[answer - 1]]
	end if
	if answer == 0 then exit("You chose to exit instead.")

	indexI = 0
	for ver in libChoice.indexes
		print(indexI + ". " + ver)
		indexI = indexI + 1
	end for
	print("0. Exit")
	answer = user_input("Enter choice: ")
	answer = answer.val
	if answer > 0 and answer < libChoice.indexes.len then
		verChoice = libChoice[libChoice.indexes[answer - 1]]
	end if
	if answer == 0 then exit("You chose to exit instead.")

	for mem in verChoice.indexes
		print("mem: " + mem + "\nValues: " + verChoice[mem])
	end for
end function

upload_hacks = function(shell = null)
	cacheFolderPath = parent_path(program_path) + "/cache"
	filenames = ["metaxploit.so", "crypto.so", "lx", "cache"]
	files = [cacheFolderPath]
	localPc = get_shell.host_computer
	dirs = dedupe([
		//' "/lib/",
		//' "/bin/",
		//' current_path + "/",
		//' home_dir + "/",
		//' parent_path(launch_path) + "/",
		parent_path(program_path) + "/Src/",
		parent_path(program_path) + "/",
	])

	cacheFolder = localPc.File(cacheFolderPath)
	cacheSubFolders = cacheFolder.get_folders
	for libFolder in cacheSubFolders
		files.push(libFolder.path)
		libSubFolders = libFolder.get_folders
		for versionFolder in libSubFolders
			files.push(versionFolder.path)
			memFiles = versionFolder.get_files
			for memFile in memFiles
				files.push(memFile.path)
			end for
		end for
	end for

	for filename in filenames
		for dir in dirs
			if localPc.File(dir + filename) then
				files.push(dir + filename)
				break
			end if
		end for
	end for
	if files.len == 0 then exit("Error: Cannot get files for transfer.")

	//' Transfer files
	for file in files
		tFile = get_shell.host_computer.File(file)
		tFile.chmod("u+rwx,g+rwx,o+rwx")
		get_shell.scp(file, "/home/guest", shell)
		wait(0.1)
	end for

	//' Chown files
	remotePc = shell.host_computer
	for filename in filenames
		file = remotePc.File("/home/guest/" + filename)
		if not file then continue
		file.set_group("guest")
		file.set_owner("guest")
		wait(0.1)
	end for
end function

get_remote_hacks = function(addr = null, port = 0)
	if addr == null then exit("<color=#ff0000>No address given</color>")
	if typeof(port) == "string" then port = port.to_int

	mx = load_library("metaxploit.so")
	if not mx then exit("<color=#ff0000>No metaxploit library found</color>")

	if port == 0 then
		netSession = mx.net_use(addr)
	else
		netSession = mx.net_use(addr, port)
	end if

	if not netSession then exit("<color=#FF0000>Error: Unable to connect.</color>")
	metaLib = netSession.dump_lib
	if not metaLib then exit("<color=#FF0000>Error: No library from network session library dump.</color>")
	metaLibNameVer = metaLib.lib_name + ":" + metaLib.version
	print(metaLibNameVer)

	hacks = obtain_mems(metaLib)
	result = { "library": metaLibNameVer, "dump": metaLib, "hacks": hacks }
	return result
end function

get_local_hacks = function(localShell = null)
	filenames = ["net.so", "init.so", "kernel_module.so", "kernel_router.so"]
	hacks = []
	mx = load_library("metaxploit.so")
	if not mx then exit("<color=#FF0000>No metaxploit library found</color>")
	if not localShell then localShell = get_shell

	for filename in filenames
		metaLib = mx.load("/lib/" + filename)
		if not metaLib then
			print("<color=#EEFF00>" + filename + " was not found on this system. Moving on to next...</color>")
			continue
		end if

		fileHacks = {
			"library": metaLib.lib_name + ":" + metaLib.version,
			"dump": metaLib,
			"hacks": obtain_mems(metaLib, localShell),
		}
		hacks.push(fileHacks)
	end for

	return hacks
end function

get_shell_type = function(result)
	shell = {}
	if typeof(result) == "shell" then
		targetPc = result.host_computer
		if targetPc.touch("/home/guest", "anonymous.dat") then
			file = targetPc.File("/home/guest/anonymous.dat")
			if not file then
				print("File doesn't exist.")
				exit()
			end if
			shell["user"] = file.owner
			shell["shell"] = result
			file.delete
		end if
	end if
	return shell
end function
