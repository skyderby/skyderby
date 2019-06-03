class Profile < ApplicationRecord
  module Mergeable
    extend ActiveSupport::Concern

    class_methods do
      def has_many_associations # rubocop:disable Naming/PredicateName
        reflections.select do |_association_name, reflection|
          reflection.macro == :has_many
        end
      end
    end

    def merge_with(another)
      return false unless another
      return false if self == another

      transaction do
        merge_attributes_from(another)
        replace_reference_in_associations(another)
        save!
      end
    end

    private

    def merge_attributes_from(another)
      change_owner = owner.blank? && another.owner && another.belongs_to_user?
      self.owner = another.owner if change_owner

      self.country ||= another.country
      self.userpic = another.userpic if another.userpic.present?
    end

    def replace_reference_in_associations(another)
      self.class.has_many_associations
          .map { |association_name, _reflection| another.public_send(association_name) }
          .each { |collection| replace_reference_in_collection(collection) }
    end

    def replace_reference_in_collection(collection)
      # update_columns on element using instead of update_all because readonly?
      # should be checked
      collection.each do |record|
        record.update_columns(profile_id: id) unless record.readonly? # rubocop:disable Rails/SkipsModelValidations
      end
    end
  end
end
