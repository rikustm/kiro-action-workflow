import Permission from '../models/Permission.js';

export const checkWorkflowPermission = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const workflowId = req.params.id || req.params.workflowId;
      
      if (!workflowId) {
        return res.status(400).json({
          status: 'error',
          message: 'Workflow ID required'
        });
      }

      const permission = await Permission.findOne({
        workflow_id: workflowId,
        user_id: req.user._id
      });

      if (!permission) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied to this workflow'
        });
      }

      const roleHierarchy = {
        'Viewer': 1,
        'Editor': 2,
        'Admin': 3
      };

      if (roleHierarchy[permission.role] < roleHierarchy[requiredRole]) {
        return res.status(403).json({
          status: 'error',
          message: `${requiredRole} access required`
        });
      }

      req.workflowPermission = permission;
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking permissions'
      });
    }
  };
};
