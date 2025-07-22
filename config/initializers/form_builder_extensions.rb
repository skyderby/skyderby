class ActionView::Helpers::FormBuilder
  def switch(method, options = {}, &)
    template = @template

    name = options[:name] || field_name(method)
    field_id = options[:id] || field_id(method)
    checked = options.fetch(:checked) { @object&.public_send(method) if @object.respond_to?(method) }

    switch_options = {
      id: field_id,
      name:,
      checked:,
      label_text: options[:label_text],
      disabled: options[:disabled],
      data: options[:data] || {},
      include_hidden: options.fetch(:include_hidden, true),
      checked_value: options.fetch(:checked_value, '1'),
      unchecked_value: options.fetch(:unchecked_value, '0'),
      reverse_visual: options.fetch(:reverse_visual, false)
    }

    if block_given?
      template.render('components/switch', **switch_options, &)
    else
      template.render('components/switch', **switch_options)
    end
  end
end
