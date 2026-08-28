from accounts.models import User
from approvals.models import TaskApproval, ApprovalStatus

def accounts_context(request):
    """Context processor providing demo users list and pending approval counts."""
    data = {}
    if request.user.is_authenticated:
        try:
            data['pending_approvals_count'] = TaskApproval.objects.filter(
                reviewer=request.user,
                status=ApprovalStatus.PENDING
            ).count()
        except Exception:
            data['pending_approvals_count'] = 0
            
    try:
        data['all_org_users'] = User.objects.filter(is_active=True).order_by('id')
    except Exception:
        data['all_org_users'] = []
        
    return data
