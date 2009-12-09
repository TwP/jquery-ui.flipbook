
begin
  require 'bones'
rescue LoadError
  abort '### Please install the "bones" gem ###'
end

ensure_in_path 'lib'
require 'jquery-ui.flipbook'

task :default => 'test:run'
task 'gem:release' => 'test:run'

Bones {
  name  'jquery-ui.flipbook'
  authors  'Tim Pease'
  email  'tim.pease@gmail.com'
  url  'http://github.com/TwP/jquery-ui.flipbook'
  version  JqueryUi.flipbook::VERSION
  ignore_file  '.gitignore'
}

# EOF
