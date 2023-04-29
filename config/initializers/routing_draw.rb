class ActionDispatch::Routing::Mapper
  def draw(routes_name)
    instance_eval(Rails.root.join('config', 'routes', "#{routes_name}.rb").read)
  end
end
