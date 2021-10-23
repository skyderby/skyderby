target :app do
  signature 'app'
  signature 'vendor/sig'

  check 'app/controllers/concerns'

  configure_code_diagnostics(Steep::Diagnostic::Ruby.strict)
end

# target :test do
#   signature "sig", "sig-private"
#
#   check "test"
#
#   # library "pathname", "set"       # Standard libraries
# end
