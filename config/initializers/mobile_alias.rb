ActionController::Responder.class_eval do
  alias_method :to_mobile, :to_html
end
