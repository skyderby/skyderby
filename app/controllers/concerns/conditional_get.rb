module ConditionalGet
  extend ActiveSupport::Concern

  def etags_for(record)
    [record, Current.user.id, I18n.locale, mobile?].compact
  end
end
