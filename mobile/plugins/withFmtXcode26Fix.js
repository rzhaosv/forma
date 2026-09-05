// Xcode 26 (clang 17) fails to compile fmt 11.0.2 (React Native 0.81): "call to consteval function
// ... is not a constant expression" in fmt/format-inl.h. Defining FMT_CONSTEVAL as empty disables the
// consteval path; behaviour is unchanged. Remove once react-native ships a newer fmt.
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SNIPPET = `
    # withFmtXcode26Fix: fmt 11.0.2 + Xcode 26 consteval workaround
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |bc|
        defs = bc.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || '$(inherited)'
        defs = defs.join(' ') if defs.is_a?(Array)
        bc.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = "#{defs} FMT_CONSTEVAL=" unless defs.include?('FMT_CONSTEVAL')
        flags = bc.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
        flags = flags.join(' ') if flags.is_a?(Array)
        bc.build_settings['OTHER_CPLUSPLUSFLAGS'] = "#{flags} -DFMT_CONSTEVAL=" unless flags.include?('FMT_CONSTEVAL')
      end
    end
    ['fmt/include/fmt/base.h', 'fmt/include/fmt/core.h', 'fmt/include/fmt/format.h'].each do |rel|
      f = File.join(installer.sandbox.root.to_s, rel)
      next unless File.exist?(f)
      src = File.read(f)
      next if src.include?('withFmtXcode26Fix')
      patched = "// withFmtXcode26Fix: force non-consteval format strings under Xcode 26 clang\n#ifndef FMT_CONSTEVAL\n#define FMT_CONSTEVAL\n#endif\n" + src
      File.write(f, patched)
      puts "withFmtXcode26Fix: patched #{rel}"
    end
`;

module.exports = function withFmtXcode26Fix(config) {
  return withDangerousMod(config, [
    'ios',
    async (c) => {
      const podfile = path.join(c.modRequest.platformProjectRoot, 'Podfile');
      let s = fs.readFileSync(podfile, 'utf8');
      if (!s.includes('withFmtXcode26Fix')) {
        if (!/post_install do \|installer\|\n/.test(s)) throw new Error('withFmtXcode26Fix: post_install hook not found in Podfile');
        s = s.replace(/post_install do \|installer\|\n/, (m) => m + SNIPPET);
        fs.writeFileSync(podfile, s);
      }
      return c;
    },
  ]);
};
