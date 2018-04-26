module ConditionalGet
  extend ActiveSupport::Concern

  def etags_for(record)
    [record, current_user.try(:id), I18n.locale, mobile?].compact
  end
end
