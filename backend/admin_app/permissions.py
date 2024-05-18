from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    message = 'Access Denied: Must be superuser.'

    def has_permission(self, request, view):
        return request.user.is_superuser