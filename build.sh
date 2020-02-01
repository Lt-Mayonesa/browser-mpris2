#!/bin/bash
# Compile all source code into dist/ folder

set -e # exit if any command fails

function title() {
    green="\e[32m"
    fin="\e[0m"
    echo -e "\n${green}$1${fin}"
}

version=${1:-v666}
out="dist/"

if [[ -d ${out} ]]; then
    rm -rf ${out}
fi

# COMPILE EXTENSION
title "COMPILE EXTENSION"

extension=${out}"extension/"
lang_out="ECMASCRIPT_2015"


title "Step 1: Base Scripts"
npx google-closure-compiler --js='src/browser/main/**.js' --js_output_file="${extension}base.js" --language_out=${lang_out}
echo "Compiled all files from src/browser/media into ${extension}base.js ✓";

title "Step 2: Provider Scripts"
for filename in src/browser/providers/*.js; do
	echo "↳ Compiling $filename"
	name=$(basename ${filename})
	npx google-closure-compiler --js="$filename" --js_output_file="${extension}providers/$name" --language_out=${lang_out}
done
echo "Compiled all providers into ${extension}providers/ ✓"

title "Step 3: Init Script"
npx google-closure-compiler --js='src/browser/init.js' --js_output_file="${extension}init.js" --language_out=${lang_out}
echo "Compiled src/browser/init.js into ${extension}init.js ✓"

title "Step 4: Background Scripts"
for filename in src/browser/background/*.js; do
	echo "↳ Compiling $filename"
	name=$(basename ${filename})
	npx google-closure-compiler --js="$filename" --js_output_file="${extension}background/$name" --language_out=${lang_out}
done
echo "Compiled background scripts into ${extension}background/ ✓"

title "Step 5: Popup files"
for filename in src/browser/popup/*.js; do
	echo "↳ Compiling $filename"
	name=$(basename ${filename})
	npx google-closure-compiler --js="$filename" --js_output_file="${extension}popup/$name" --language_out=${lang_out}
done
cp -v "src/browser/popup/popup.html" "${extension}popup/"
echo "Compiled popup files into ${extension}popup/ ✓"

title "Step 6: Manifest"
# replace version, first and last content script js with base.js and init.js respectively
cat src/browser/manifest.json | \
    jq '.name = "browser-mpris2"' | \
    jq '.version = "'${version/v/}'"' | \
    jq '.content_scripts[0].js = ["base.js"]' | \
	jq '.content_scripts[-1].js = ["init.js"]' \
	> ${extension}manifest.json
# replace all instances of src/ with empty string
echo "Generated ${extension}manifest.json ✓"

title "Step 7: Copy assets"
cp -v -R src/browser/assets "${extension}/assets"


# COMPILE NATIVE
title "COMPILE NATIVE"
native=${out}"native/"

title "Step 1: Copy source files"
mkdir -p ${native}"DEBIAN" && cp -v "src/native/control" ${native}"DEBIAN/"
cp -v "src/native/postinst" ${native}"DEBIAN/"
mkdir -p ${native}"usr/bin" && cp -v "src/native/browser-mpris2" ${native}"usr/bin/"

title "Step 2: Make scripts executable"
chmod +x ${native}"usr/bin/browser-mpris2"
chmod +x ${native}"DEBIAN/postinst"


title "PACKAGE"

title "Step 1: Replace package id and version"
grep -lR "\$version" dist/ | xargs sed -i 's/$version/'${version/v/}'/g'
echo "Replaced all occurrences of '\$version' with '"${version/v/}"' ✓"

grep -lR org.mpris.browser_host.debug dist/ | xargs sed -i 's/org.mpris.browser_host.debug/org.mpris.browser_host/g'
echo "Replaced all occurrences of 'org.mpris.browser_host.debug' with 'org.mpris.browser_host' ✓"

# Compress extension and native to a release zip
title "Step 2: Zip Release"
cd dist
zip -r "browser-mpris2-$version.zip" "."
cd ..
echo "Created release .zip for version $version ✓"

if [[ "$version" != "v666" ]]; then
    title "Step 3: Package Chrome extension"
    /opt/google/chrome/chrome --no-message-box --pack-extension=./dist/extension --pack-extension-key=./extension.pem
    mv ${out}"extension.crx" ${out}"browser-mpris2-${version}-chrome.crx"
    echo "Create release .crx for version $version ✓"

    title "Step 4: Sign Firefox extension"
    cat package.json | jq '.version = "'${version/v/}'"' > package.tmp.json && mv package.tmp.json package.json
    npx web-ext sign -s ${extension} -a ${out} --api-key=${MOZ_API_KEY} --api-secret=${MOZ_API_SECRET} --id=browser-mpris2@lt-mayonesa.github.io
    mv ${out}*.xpi ${out}"browser-mpris2-${version}-firefox.xpi"

    title "Step 5: Build .deb package"
    sudo chown root:root ${native}"usr/bin/browser-mpris2"
    dpkg-deb -b ${native} ${out}"browser-mpris2-${version}-native.deb"

    echo "Created release for version $version successfully! ✓"
fi

title "DONE ✓"
exit 0;
