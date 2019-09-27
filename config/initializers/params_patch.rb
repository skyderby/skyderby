module DeepTransformKeys
  def deep_transform_keys!(&block)
    @parameters.deep_transform_keys!(&block)
    self
  end
end

ActionController::Parameters.include(DeepTransformKeys)
