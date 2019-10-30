module Attachment
  class PromoteJob < ApplicationJob
    def perform(attacher_class, record_class, record_id, name, file_data)
      attacher_class = Object.const_get(attacher_class)
      record         = Object.const_get(record_class).find(record_id)

      attacher = attacher_class.retrieve(model: record, name: name, file: file_data)
      # attacher.create_derivatives if record.is_a?(Album)
      attacher.atomic_promote
    rescue Shrine::AttachmentChanged
      Rails.logger.info('Failed to promote due to attachment changed')
    end
  end
end
