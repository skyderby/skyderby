module ConditionalGet
  extend ActiveSupport::Concern

  included do
    etag { Current.user.id }
    etag { I18n.locale }
    etag { mobile? }
  end
end
