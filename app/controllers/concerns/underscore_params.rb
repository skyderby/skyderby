module UnderscoreParams
  extend ActiveSupport::Concern

  included do
    before_action :underscore_params!
  end

  def underscore_params!
    params.deep_transform_keys!(&:underscore)
  end
end
