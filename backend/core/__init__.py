from django.template.context import BaseContext, Context, RequestContext

def _fixed_context_copy(self):
    # Instanciamos Context y clonamos todos los atributos dinámicos (incluye template, etc.)
    duplicate = Context()
    duplicate.__dict__.update(self.__dict__)
    duplicate.dicts = self.dicts[:]
    return duplicate

def _fixed_requestcontext_copy(self):
    # Para RequestContext inicializamos con su request y transferimos todos los atributos
    duplicate = RequestContext(self.request)
    duplicate.__dict__.update(self.__dict__)
    duplicate.dicts = self.dicts[:]
    return duplicate

# Reemplazamos los métodos __copy__ afectados por el cambio en Python 3.14
BaseContext.__copy__ = _fixed_context_copy
Context.__copy__ = _fixed_context_copy
RequestContext.__copy__ = _fixed_requestcontext_copy