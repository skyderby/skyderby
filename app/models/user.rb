class User < ActiveRecord::Base

  has_many :tracks, :dependent => :destroy

  has_many :assignments
  has_many :roles, :through => :assignments

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  def has_role?(role_sym)
    roles.any? { |r| r.name.underscore.to_sym == role_sym }
  end

end
