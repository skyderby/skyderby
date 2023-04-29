module DeepTransformKeys
  def deep_transform_keys!(&)
    @parameters.deep_transform_keys!(&)
    self
  end
end

ActionController::Parameters.include(DeepTransformKeys)
